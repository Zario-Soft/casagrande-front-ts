import moment from "moment";

export const formatDate = (value: any): string => {
    const dt = moment(value, "yyyy-MM-DD");
    return dt.isValid()
        ? dt.format("DD/MM/yyyy")
        : "--"
}

export const formatDateUnknown = (date: Date) => moment(date).format("yyyy-MM-DD") as unknown as Date;

const moneyFormater = Intl.NumberFormat("pt-br", { style: 'currency', currency: 'BRL' })
export const formatMoney = (params: any) => moneyFormater.format(params);

export const parseJwt = (token: string) => {
    if (!token) return;

    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));

    return JSON.parse(jsonPayload);
}

export const IsAuthorized = (route: string) => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    const decodedToken = parseJwt(token);
    if (!decodedToken) return false;

    const allowedRoutes = [...(decodedToken.allowed_routes as string ?? '').split(','), '/'];

    return !!decodedToken.is_admin || allowedRoutes.find(r => r === route) !== undefined;
}

export const ToPascalCase = (str: string | undefined) => {
    if (!str) return str;

    return str.replace(/(\w)(\w*)/g,
        function(_,g1,g2){return g1.toUpperCase() + g2.toLowerCase();});
}
