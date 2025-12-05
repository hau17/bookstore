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
    res.status(500).send("Internal Server Error");
  }
};
