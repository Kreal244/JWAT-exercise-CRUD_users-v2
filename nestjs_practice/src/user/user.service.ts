import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { overwriteDatabase, readFromDatabase, writeToDatabase } from 'utils';

@Injectable()
export class UserService {
  create(createUserDto: CreateUserDto) {
    const username = createUserDto.username;
    const database = readFromDatabase();
    if (database.length > 0) {
      const filter = database.filter((user) => user.username === username);
      if (filter.length == 0) {
        writeToDatabase(createUserDto);
      } else {
        return { message: 'Username already exists' };
      }
    } else {
      writeToDatabase(createUserDto);
    }
    return { message: 'User created successfully' };
  }

  findAll() {
    return { data: readFromDatabase() };
  }

  findOne(username: string) {
    const database = readFromDatabase();
    const filter = database.filter((user) => user.username === username);
    if (filter.length == 0) {
      return { message: 'User not found' };
    }
    return { data: filter };
  }

  update(updateUserDto: UpdateUserDto) {
    const username = updateUserDto.username;
    const database = readFromDatabase();
    const new_database = database.map((user) => {
      if (user.username !== username) {
        return user;
      } else {
        return updateUserDto;
      }
    });
    overwriteDatabase(new_database);
    return { message: 'User updated successfully' };
  }

  remove(usernme: string) {
    const database = readFromDatabase();
    const new_database = database.filter((user) => user.username !== usernme);
    overwriteDatabase(new_database);
    return { message: 'User deleted successfully' };
  }
}
