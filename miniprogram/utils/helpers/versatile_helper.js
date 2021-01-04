function difficulty_to_stars(difficulty){
  switch(difficulty){
    case(1):
      return "★☆☆☆☆";
      break;
    case(2):
      return "★★☆☆☆";
      break;
    case(2):
      return "★★★☆☆";
      break;
    case(2):
      return "★★★★☆";
      break;
    case(2):
      return "★★★★★";
      break;
    default:
      return "警告：未知难度！"
      break;
  }
}

module.exports = {
  difficulty_to_stars: difficulty_to_stars
}