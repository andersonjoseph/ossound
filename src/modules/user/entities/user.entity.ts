export type UserProps = {
  id: number,
  username: string,
  email: string,
  password: string
}

export type SerializedUserProps = Omit<UserProps, 'password' | 'id'> & {
  id: string
}

export class User {
  id: number;
  username: string;
  email: string;
  password: string;

  constructor(props: UserProps) {
    this.id = props.id;
    this.username = props.username;
    this.email = props.email;
    this.password = props.password;
  }

}
