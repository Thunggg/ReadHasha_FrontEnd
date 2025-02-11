export { };

declare global {
    interface IBackendRes<T> {
        error?: string | string[];
        message: string;
        statusCode: number | string;
        data?: T;
        access_token?: string;
        refresh_token?: string;
    }

    interface IModelPaginate<T> {
        meta: {
            current: number;
            pageSize: number;
            pages: number;
            total: number;
        },
        result: T[]
    }


    interface IRegister {
        username: string,
        firstName: string,
        lastName: string,
        password: string,
        dob: DATE,
        email: string,
        phone: string,
        role: number,
        address: string,
        sex: number,
        accStatus: number,
        code: string
    }

    interface ILogin {
        access_token: string;
        refresh_token: string;
        user: {
            email: string;
            phone: string;
            fullName: string;
            role: string;
            avatar: string;
            id: string;
        }
    }

}