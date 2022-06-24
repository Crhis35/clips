export default interface IUser {
  name: string | null;
  email: string | null;
  age: number | null;
  password?: string | null;
  phoneNumber: string | null;
}
