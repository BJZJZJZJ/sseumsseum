const Category = require("../models/Category");
const UserCategory = require("../models/UserCategory");
const mongoose = require("mongoose");

// 카테고리 메타데이터 생성 및 유저에게 추가
const createCategory = async (req, res) => {
  try {
    const { name, type } = req.body;
    const parentCategory = req.body.parentCategory || null;

    const userId = req.user.id;

    // 카테고리 메타데이터가 존재하는지 확인
    const existCategory = await Category.findOne({
      name: name,
      type: type,
      parentCategory: parentCategory,
    });

    if (parentCategory) {
      const parent = await Category.findById(parentCategory).lean();
      if (!parent) {
        return res
          .status(404)
          .json({ message: "대분류 카테고리가 존재하지 않습니다." });
      }
    }

    // 있으면 카테고리 ID 값만 챙김
    let categoryId;
    if (existCategory) {
      categoryId = existCategory._id;
    } else {
      // 새로운 카테고리인 경우 메타데이터 생성
      const newCatDoc = await Category.create({
        name,
        type,
        parentCategory,
      });
      categoryId = newCatDoc._id;
    }

    // UserCategory에 중복 확인 후 추가
    const userCategoryExists = await UserCategory.findOne({
      userId: userId,
      categoryId: categoryId,
    });

    if (!userCategoryExists) {
      await UserCategory.create({ userId: userId, categoryId: categoryId });
      return res
        .status(201)
        .json({ message: "카테고리가 성공적으로 추가되었습니다." });
    } else {
      return res.status(409).json({ message: "이미 존재하는 카테고리입니다." });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
};

const updateCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const { name, type } = req.body;
    const userId = req.user.id;

    // 카테고리가 사용자의 것인지 확인
    const category = await Category.findOne({
      _id: categoryId,
      userId: userId,
    });
    if (!category) {
      return res.status(403).json({ message: "권한이 없습니다." });
    }

    category.name = name;
    category.type = type;
    category.updatedAt = Date.now();
    await category.save();

    res.status(200).json({
      id: category._id,
      name: category.name,
      type: category.type,
    });
  } catch (error) {
    res.status(500).json({ message: "서버 오류", error: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const userId = req.user.id;
    const categoryId = req.params.id;

    // 1. 해당 카테고리가 사용자의 것인지 확인
    const userCategory = await UserCategory.findOne({
      userId: userId,
      categoryId: categoryId,
    });

    if (!userCategory) {
      return res
        .status(404)
        .json({ message: "해당 카테고리를 찾을 수 없습니다." });
    }

    // 대분류 카테고리를 삭제하는 경우, 소분류 카테고리도 함께 삭제
    const category = await Category.findById(categoryId);
    if (!category.parentCategory) {
      const subCategories = await Category.find({ parentCategory: categoryId });
      const subCategoryIds = subCategories.map((sub) => sub._id);
      await UserCategory.deleteMany({
        userId: userId,
        categoryId: { $in: subCategoryIds },
      });
    }

    // 2. UserCategory 문서 삭제 (사용자의 카테고리 목록에서 제거)
    await UserCategory.deleteOne({ _id: userCategory._id });

    // 3. (선택사항) 해당 카테고리가 포함된 거래내역 업데이트
    // 카테고리를 null로 설정하거나, '기타' 카테고리로 변경하는 로직 추가
    // await Transaction.updateMany({ categoryId: categoryId }, { categoryId: null });

    return res
      .status(200)
      .json({ message: "카테고리가 성공적으로 삭제되었습니다." });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "서버 에러가 발생했습니다." });
  }
};

// 유저 카테고리 조회
const getUserCategories = async (req, res) => {
  try {
    const userId = req.user.id;

    const userCategories = await UserCategory.aggregate([
      // 1. 특정 유저의 카테고리만 필터링
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },

      // 2. Category 컬렉션과 조인하여 소분류 정보 가져오기
      {
        $lookup: {
          from: "Categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "categoryDetails",
        },
      },
      // $lookup 결과는 배열이므로 $unwind로 풀어줍니다.
      { $unwind: "$categoryDetails" },

      // 3. 소분류의 부모 카테고리(대분류) 정보 가져오기
      {
        $lookup: {
          from: "categories",
          localField: "categoryDetails.parentCategory",
          foreignField: "_id",
          as: "parentCategoryDetails",
        },
      },
      {
        $unwind: {
          path: "$parentCategoryDetails",
          preserveNullAndEmptyArrays: true,
        },
      },

      // 4. 클라이언트에게 필요한 형태로 데이터 재구성
      {
        $project: {
          _id: "$categoryDetails._id",
          name: "$categoryDetails.name",
          type: "$categoryDetails.type",
          parentCategoryId: "$categoryDetails.parentCategory",
          parentCategoryName: "$parentCategoryDetails.name",
        },
      },
    ]);

    // 2. 대분류와 소분류로 나누어 계층 구조 만들기
    const parentCategories = userCategories.filter(
      (cat) => !cat.parentCategoryId
    );
    const subCategories = userCategories.filter((cat) => cat.parentCategoryId);

    const structuredCategories = parentCategories.map((parent) => {
      return {
        id: parent._id,
        name: parent.name,
        type: parent.type,
        subcategories: subCategories
          .filter((sub) => sub.parentCategoryId.equals(parent._id))
          .map((sub) => ({
            id: sub._id,
            name: sub.name,
            type: sub.type,
          })),
      };
    });

    return res.status(200).json(structuredCategories);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "서버 에러가 발생했습니다." });
  }
};

// 기본 카테고리 대분류 조회
const getDefaultMajorCategories = async (_, res) => {
  try {
    const defaultMajorCategory = await Category.find({
      isDefault: true,
      parentCategory: null,
    }).select("_id name type");

    return res.status(200).json({ major: defaultMajorCategory });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "서버 에러가 발생했습니다." });
  }
};

// 기본 카테고리 소분류 카테고리
const getDefaultSubCategories = async (req, res) => {
  try {
    const parentId = req.query.parentId;

    const defaultSubCategory = await Category.find({
      isDefault: true,
      parentCategory: parentId,
    }).select("_id name type");

    return res.status(200).json({ sub: defaultSubCategory });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "서버 에러가 발생했습니다." });
  }
};

module.exports = {
  createCategory,
  deleteCategory,

  getDefaultMajorCategories,
  getDefaultSubCategories, // 입력값 검증 필요

  getUserCategories,
};

// updateCategory,
