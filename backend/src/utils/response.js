export function success(res, data, status = 200) {
  return res.status(status).json({ success: true, data });
}

export function error(message, status = 400) {
  const err = new Error(message);
  err.status = status;
  return err;
}
