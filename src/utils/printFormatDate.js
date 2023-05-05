import { format } from "date-fns";

const printFormatDate = (doc) => {
  if (!doc.timestamp) return null;

  return format(doc.timestamp.toDate(), "yyyy/MM/dd HH:mm");
};

export default printFormatDate;
