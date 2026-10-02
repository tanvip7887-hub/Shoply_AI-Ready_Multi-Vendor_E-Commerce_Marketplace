import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

export const hashValue = async (value) => bcrypt.hash(value, SALT_ROUNDS);

export const compareValue = async (value, hash) => bcrypt.compare(value, hash);