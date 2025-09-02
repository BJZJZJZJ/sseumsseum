const Category = require("../models/Category");

// 카테고리 생성, 조회, 수정, 삭제 컨트롤러
const createCategory = async (req, res) => {
  try {
    const { name, type } = req.body;
    const userId = req.user.id;

    const newCategory = new Category({
      userId: userId,
      name,
      type,
    });

    const savedCategory = await newCategory.save();
    res.status(201).json({
      message: "카테고리가 성공적으로 생성되었습니다.",
      newCategory: {
        id: savedCategory._id,
        name: savedCategory.name,
        type: savedCategory.type,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "서버 오류", error: error.message });
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
      message: "카테고리가 성공적으로 수정되었습니다.",
      updatedCategory: {
        id: category._id,
        name: category.name,
        type: category.type,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "서버 오류", error: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const userId = req.user.id;

    // 카테고리가 사용자의 것인지 확인
    const category = await Category.findOne({
      _id: categoryId,
      userId: userId,
    });
    if (!category) {
      return res.status(403).json({ message: "권한이 없습니다." });
    }

    const deletedCategory = await Category.findByIdAndDelete(categoryId);

    if (!deletedCategory) {
      return res.status(404).json({ message: "카테고리를 찾을 수 없습니다." });
    }
    res.status(200).json({ message: "카테고리가 성공적으로 삭제되었습니다." });
  } catch (error) {
    res.status(500).json({ message: "서버 오류", error: error.message });
  }
};

/* 어떻게 만들어야할지 좀 더 고민해보자
 프론트를 어떻게 만들지부터 생각해봐야 할 듯한 주제
  -> 프론트에서 카테고리 관리 할 때 리스트 주는 api로 고려
*/
const getCategories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // 기본값 1
    const limit = parseInt(req.query.limit) || 10; // 기본값 10
    const skip = (page - 1) * limit;

    const userId = req.user.id;
    const categories = await Category.find({ userId: userId })
      .select("id name type")
      .skip(skip)
      .limit(limit);

    if (categories.length === 0) {
      return res.status(404).json({ message: "카테고리가 없습니다." });
    }

    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: "서버 오류", error: error.message });
  }
};

module.exports = {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategories,
};
