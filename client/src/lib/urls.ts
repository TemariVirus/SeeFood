export const apiUrl = "/";
export const restaurantGetUrl = `${apiUrl}restaurants/`;

export const commentsGetUrl = (id: number) =>
  `${apiUrl}restaurants/${id}/comments/`;
export const commentsPostUrl = (isReply: boolean) =>
  `${apiUrl}comments/?isReply=${isReply}`;
export const commentsPutUrl = (id: number, isReply: boolean) =>
  `${apiUrl}comments/?id=${id}&isReply=${isReply}`;
export const commentsDeleteUrl = (id: number, isReply: boolean) =>
  `${apiUrl}comments/?id=${id}&isReply=${isReply}`;
