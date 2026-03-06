export const updateItemRating = async (item, newRating, oldRating) => {

  if (oldRating !== null) {
    item.totalRating = item.totalRating - oldRating + newRating;
  } else {
    item.totalRating += newRating;
    item.reviewCount += 1;
  }

  await item.save();
};