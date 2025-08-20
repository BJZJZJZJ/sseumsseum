const test = (req, res) => {
  console.log("test API is working!");
  res.json({ msg: "Test API is working!" });
};

module.exports = {
  test,
};
