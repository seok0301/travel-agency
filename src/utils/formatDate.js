const formatDate = (timestamp) => {
  if (!timestamp) return null;

  const date = timestamp.toDate();
  return date.toLocaleDateString();
};

export default formatDate;
