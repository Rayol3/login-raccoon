import { Request, Response } from 'express';
import { AuthRepository } from '../../domain/repositories/auth.repository';
import { RegisterUserDto } from '../../domain/dtos/auth/register-user.dto';
import { RegisterUser } from '../../domain/use-cases/auth/register-user.use-case';
import { LoginUserDto } from '../../domain/dtos/auth/login-user.dto';
import { LoginUser } from '../../domain/use-cases/auth/login-user.use-case';
import { CustomError } from '../../domain/errors/custom.error';
import { JwtAdapter } from '../../config/jwt.adapter';

export class AuthController {
    constructor(
        private readonly authRepository: AuthRepository,
    ) { }

    private handleError = (error: unknown, res: Response) => {
        if (error instanceof CustomError) {
            return res.status(error.statusCode).json({ error: error.message });
        }

        console.log(`${error}`);
        return res.status(500).json({ error: 'Internal Server Error' });
    };

    registerUser = (req: Request, res: Response) => {
        const [error, registerUserDto] = RegisterUserDto.create(req.body);
        if (error) return res.status(400).json({ error });

        new RegisterUser(this.authRepository, JwtAdapter.generateToken)
            .execute(registerUserDto!)
            .then((data) => res.json(data))
            .catch((error) => this.handleError(error, res));
    };

    loginUser = (req: Request, res: Response) => {
        const [error, loginUserDto] = LoginUserDto.create(req.body);
        if (error) return res.status(400).json({ error });

        new LoginUser(this.authRepository, JwtAdapter.generateToken)
            .execute(loginUserDto!)
            .then((data) => res.json(data))
            .catch((error) => this.handleError(error, res));
    };
}
