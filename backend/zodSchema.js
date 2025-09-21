import zod from "zod";

const userSchema = zod.object({
  username: zod.email().min(3).max(30),
  password: zod.string().min(6),
  firstName: zod.string().max(50).trim(),
  lastName: zod.string().max(50).trim(),
});

const loginUserSchema=zod.object({
    username: zod.email().min(3).max(30),
    password: zod.string().min(6)
});

export {
  userSchema,
  loginUserSchema,
};