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
        translator?: string,
        publisher: string,
        publicationYear: number,
        isbn: string,
        image?: string,
        bookDescription: string,
        hardcover: number,
        dimension: string,
        weight: number,
        bookPrice: number,
        bookQuantity: number,
        bookStatus: number,
        totalSold?: number,
        bookCategories: IBookCategory[];
    }

    interface ICart {
        id: number;
        quantity: number;
        detail: IBook;
    }

    interface IOrderRequest {
        username: string;
        address: string;
        details: IOrderDetailRequest[];
    }

    interface IOrderDetailRequest {
        bookId: number;
        quantity: number;
    }

    interface IHistoryDetail {
        odid: number;
        quantity: number;
        totalPrice: number;
        bookID: {
            bookID: number;
            bookTitle: string;
            author: string;
            bookPrice: number;
            // Các trường khác nếu cần
        };
    }

    interface IHistory {
        orderID: number;
        orderDate: string; // hoặc Date nếu backend trả về Date object
        orderStatus: number;
        orderAddress: string;
        customerName: string;
        orderDetailList: IHistoryDetail[];
    }

    interface IPromotion {
        proID: number;
        proName: string;
        proCode: string;
        discount: number;
        startDate: Date;
        endDate: Date;
        quantity: number;
        proStatus: number;
        createdBy: IUser;
    }
}