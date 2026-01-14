const homeService = require("../../services/client/home_service.js");

exports.getAllData = async (req, res) => {
  try {
    const { newBooks, discountedBooks } = await homeService.getAllData();
    res.render("client/home", {
      title: "Home Page",
      newBooks,
      discountedBooks,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    req.session.toastr = {
      type: "error",
      message: "có lỗi xảy ra khi tải trang chủ.",
    };
    res.redirect("/");
  }
};
