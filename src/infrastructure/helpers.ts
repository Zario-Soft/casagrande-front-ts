import moment from "moment";

export const formatDate = (value: any): string => {
    //console.log(value);
    const dt = moment(value, "yyyy-MM-DD");
    //console.log(dt);
    //console.log(dt.isValid());
    return dt.isValid()
        ? dt.format("DD/MM/yyyy")
        : "--"
}

export const formatDateUnknown = (date: Date) => moment(date).format("yyyy-MM-DD") as unknown as Date;

const moneyFormater = Intl.NumberFormat("pt-br", { style: 'currency', currency: 'BRL' })
export const formatMoney = (params: any) => moneyFormater.format(params);

export const ToPascalCase = (str: string | undefined) => {
    if (!str) return str;

    return str.replace(/(\w)(\w*)/g,
        function(_,g1,g2){return g1.toUpperCase() + g2.toLowerCase();});
}

