export async function clientHandleApiError(response: Response) {
  alert(
    await response.json().then((data) => {
      if (Array.isArray(data)) {
        data = data[0];
      }
      return data.message ?? data;
    })
  );
}
