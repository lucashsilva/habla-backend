import { injectable, inject } from 'inversify';
import { interfaces } from 'inversify-express-utils';
import * as express from 'express';
import { AuthenticationService } from '../services/authentication';

const authService = inject(AuthenticationService);

@injectable()
export class AuthenticationProvider implements interfaces.AuthProvider {
    @authService private readonly _authService: AuthenticationService;

    public async getUser(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ): Promise<interfaces.Principal> {
        const token: string = req.headers["authorization"] as string;
        
        if (token) try {
            const user = await this._authService.getUserFromToken(token);
            const principal = new Principal(user);
            return principal;
        } catch (error) {
            console.log(error)
        }

        return null;
    }
}

class Principal implements interfaces.Principal {
    public details: any;

    public constructor(details: any) {
        this.details = details;
    }

    public isAuthenticated(): Promise<boolean> {
        return Promise.resolve(true);
    }

    public isResourceOwner(resource: any): Promise<boolean> {
        return Promise.resolve(resource.ownerUid === this.details.uid);
    }

    public isInRole(role: string): Promise<boolean> {
        return Promise.resolve(false);
    }
}