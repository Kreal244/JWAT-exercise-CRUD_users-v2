import { readFileSync, writeFileSync } from 'fs';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UpdateUserDto } from 'src/user/dto/update-user.dto';

export const writeToDatabase = (value: CreateUserDto) => {
  try {
    const database = readFileSync('./database.json', 'utf8');
    const parsedDatabase = JSON.parse(database);
    const newDatabase = [...parsedDatabase, value];
    writeFileSync('./database.json', JSON.stringify(newDatabase));
  } catch (error) {
    writeFileSync('./database.json', JSON.stringify([value]));
  }
};
export const overwriteDatabase = (value: (CreateUserDto | UpdateUserDto)[]) => {
  writeFileSync('./database.json', JSON.stringify(value));
};
export const readFromDatabase = () => {
  try {
    const database = readFileSync('./database.json', 'utf8');
    const parsedDatabase = JSON.parse(database);
    return parsedDatabase as CreateUserDto[];
  } catch (error) {
    return [];
  }
};
