export const apiUrl = "http://localhost:8000/";
export const restaurantGetUrl = `${apiUrl}restaurants/`;
export const restaurantCommentsGetUrl = (id: number) =>
  `${apiUrl}restaurants/${id}/comments/`;
