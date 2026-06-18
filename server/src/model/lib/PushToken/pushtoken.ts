import Database from "../../Database";

/*
 * pushtoken.create()
 * assign a new push token to the user
 */

export const create = async ({ user, token }) => {
  return await Database.User.update.one(
    { id: user },
    { $push: { push_token: token } },
  );
};

/*
 * pushtoken.get()
 * get push tokens for the user
 */

export const get = async ({ user, token }) => {
  const data = await Database.User.read.one(
    { id: user },
    { push_token: token },
  );

  return data.push_token?.length ? data.push_token : null;
};

/*
 * pushtoken.delete()
 * remove a push token for this user
 */

export const deletePushToken = async ({ user }) => {
  return await Database.User.delete.one({ user: user });
};
