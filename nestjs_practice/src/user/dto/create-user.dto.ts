export class CreateUserDto {
  username: string;
  fullName: string;
  role: string;
  project: string[];
  activeYn: boolean;
}
