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
        account: {
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
        authenticate: boolean;
        accessToken: string;
        refreshToken: string;
    }

    interface IUser {
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

    interface UpdateUserRequest {
        username?: string;
        firstName?: string;
        lastName?: string;
        dob?: DATE;
        phone?: string;
        address?: string;
        sex?: number;
        role?: number; // Thêm dấu ? ở đây
        email: string;
    }

    interface ICategory {
        catID: number;
        catName: string;
        catDescription: string;
        catStatus: number;
    }

    interface IBookCategory {
        bookCateId: number;
        catId: ICategory; // Key quan trọng cần sửa
    }

    interface ICategoryGetAll<T> {
        categories: T[];
    }

    interface IBook {
        bookID: number,
        bookTitle: String,
        author: string,
        translator: string,
        publisher: string,
        publicationYear: number,
        isbn: string,
        image: string,
        bookDescription: string,
        hardcover: number,
        dimension: string,
        weight: number,
        bookPrice: number,
        bookQuantity: number,
        bookStatus: number,
        bookCategories: IBookCategory[];
    }
}