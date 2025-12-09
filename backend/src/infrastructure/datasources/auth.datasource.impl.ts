import bcryptjs from 'bcryptjs';
import { AuthDatasource } from '../../domain/datasources/auth.datasource';
import { LoginUserDto } from '../../domain/dtos/auth/login-user.dto';
import { RegisterUserDto } from '../../domain/dtos/auth/register-user.dto';
import { UserEntity } from '../../domain/entities/user.entity';
import { CustomError } from '../../domain/errors/custom.error';
import { UserModel } from '../../data/mongodb/models/user.model';
import { UserMapper } from '../mappers/user.mapper';

type HashFunction = (password: string) => string;
type CompareFunction = (password: string, hashed: string) => boolean;

export class AuthDatasourceImpl implements AuthDatasource {
    constructor(
        private readonly hashPassword: HashFunction = (password) => bcryptjs.hashSync(password),
        private readonly comparePassword: CompareFunction = (password, hashed) => bcryptjs.compareSync(password, hashed),
    ) { }

    async login(loginUserDto: LoginUserDto): Promise<UserEntity> {
        const { email, password } = loginUserDto;

        try {
            const user = await UserModel.findOne({ email });
            if (!user) throw CustomError.badRequest('User does not exist');

            const isMatching = this.comparePassword(password, user.password);
            if (!isMatching) throw CustomError.badRequest('Password is not valid');

            return UserMapper.userEntityFromObject(user);
        } catch (error) {
            console.log(error);
            throw CustomError.internalServer();
        }
    }

    async register(registerUserDto: RegisterUserDto): Promise<UserEntity> {
        const { name, email, password } = registerUserDto;

        try {
            const exists = await UserModel.findOne({ email });
            if (exists) throw CustomError.badRequest('User already exists');

            const user = await UserModel.create({
                name: name,
                email: email,
                password: this.hashPassword(password),
            });

            await user.save();

            return UserMapper.userEntityFromObject(user);
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            }
            throw CustomError.internalServer();
        }
    }
}
