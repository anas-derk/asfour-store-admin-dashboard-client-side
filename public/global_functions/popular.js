import axios from "axios";

const getProductsCount = async (filters) => {
    try {
        const res = await axios.get(`${process.env.BASE_API_URL}/products/products-count?${filters ? filters : ""}`);
        return res.data;
    }
    catch (err) {
        throw Error(err);
    }
}

const getAllProductsInsideThePage = async (pageNumber, pageSize, filters, sortDetails) => {
    try {
        const res = await axios.get(`${process.env.BASE_API_URL}/products/all-products-inside-the-page?pageNumber=${pageNumber}&pageSize=${pageSize}&${filters ? filters : ""}&${sortDetails ? sortDetails : ""}`);
        return res.data;
    }
    catch (err) {
        throw Error(err);
    }
}

const getDateFormated = (date) => {
    let orderedDateInDateFormat = new Date(date);
    const year = orderedDateInDateFormat.getFullYear();
    const month = orderedDateInDateFormat.getMonth() + 1;
    const day = orderedDateInDateFormat.getDate();
    return `${year} / ${month} / ${day}`;
}

const getStoreDetails = async (storeId) => {
    try {
        let res;
        if (!storeId) {
            res = await axios.get(`${process.env.BASE_API_URL}/stores/main-store-details`);
        } else {
            res = await axios.get(`${process.env.BASE_API_URL}/stores/store-details/${storeId}`);
        }
        return res.data;
    }
    catch (err) {
        throw Error(err);
    }
}

const getCategoriesCount = async (filters) => {
    try {
        const res = await axios.get(`${process.env.BASE_API_URL}/categories/categories-count?${filters ? filters : ""}`);
        return res.data;
    }
    catch (err) {
        throw Error(err);
    }
}

const getAllCategoriesInsideThePage = async (pageNumber, pageSize, filters) => {
    try {
        const res = await axios.get(`${process.env.BASE_API_URL}/categories/all-categories-inside-the-page?pageNumber=${pageNumber}&pageSize=${pageSize}&${filters ? filters : ""}`);
        return res.data;
    }
    catch (err) {
        throw Error(err);
    }
}

const getAllCategories = async (filters) => {
    try {
        const res = await axios.get(`${process.env.BASE_API_URL}/categories/all-categories?${filters ? filters : ""}`)
        return res.data;
    }
    catch (err) {
        throw Error(err);
    }
}

const getStoresCount = async (filters) => {
    try {
        const res = await axios.get(`${process.env.BASE_API_URL}/stores/stores-count?${filters ? filters : ""}`);
        return res.data;
    }
    catch (err) {
        throw Error(err);
    }
}

const getAllStoresInsideThePage = async (pageNumber, pageSize, filters) => {
    try {
        const res = await axios.get(`${process.env.BASE_API_URL}/stores/all-stores-inside-the-page?pageNumber=${pageNumber}&pageSize=${pageSize}&${filters ? filters : ""}`);
        return res.data;
    }
    catch (err) {
        throw Error(err);
    }
}

const calcTotalOrderPriceBeforeDiscount = (allProductsData) => {
    let tempTotalPriceBeforeDiscount = 0;
    allProductsData.forEach((product) => {
        tempTotalPriceBeforeDiscount += product.price * getProductQuantity(product._id);
    });
    return tempTotalPriceBeforeDiscount;
}

const calcTotalOrderDiscount = (currentDate, allProductsData) => {
    let tempTotalDiscount = 0;
    allProductsData.forEach((product) => {
        tempTotalDiscount += (isExistOfferOnProduct(currentDate, product.startDiscountPeriod, product.endDiscountPeriod) ? product.discountInOfferPeriod : product.discount) * getProductQuantity(product._id);
    });
    return tempTotalDiscount;
}

const calcTotalOrderPriceAfterDiscount = (totalPriceBeforeDiscount, totalDiscount) => {
    return totalPriceBeforeDiscount - totalDiscount;
}

const calcTotalPrices = (currentDate, allProductsData) => {
    const totalPriceBeforeDiscount = calcTotalOrderPriceBeforeDiscount(allProductsData);
    const totalDiscount = calcTotalOrderDiscount(currentDate, allProductsData);
    return {
        totalPriceBeforeDiscount,
        totalDiscount,
        totalPriceAfterDiscount: calcTotalOrderPriceAfterDiscount(totalPriceBeforeDiscount, totalDiscount)
    };
}

const getTimeAndDateByLocalTime = (dateAndTimeAsString) => {
    const UTCDateAndTime = new Date(dateAndTimeAsString);
    const DateAndTimeByLocalTime = new Date(UTCDateAndTime.getTime() - UTCDateAndTime.getTimezoneOffset() * 60 * 1000);
    return DateAndTimeByLocalTime.toISOString().substring(0, 19);
}

const getRemainingTime = (milliSecondsCount) => {
    const days = Math.floor(milliSecondsCount / (1000 * 60 * 60 * 24));
    const hours = Math.floor((milliSecondsCount % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((milliSecondsCount % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliSecondsCount % (1000 * 60)) / 1000);
    return {
        days,
        hours,
        minutes,
        seconds,
    }
}

const getDateInUTCFormat = (localTimeAndDateAsString) => {
    const date = new Date(localTimeAndDateAsString);
    const diffBetweenLocalTimeAndUTC = date.getTimezoneOffset();
    date.setMinutes(date.getMinutes() + diffBetweenLocalTimeAndUTC);
    return (new Date(date.getTime() - (diffBetweenLocalTimeAndUTC * 60000))).toISOString();
}

async function getAdminInfo() {
    try{
        const res = await axios.get(`${process.env.BASE_API_URL}/admins/user-info`, {
            headers: {
                Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
            },
        });
        return res.data;
    }
    catch(err) {
        throw err;
    }
}

export {
    getProductsCount,
    getAllProductsInsideThePage,
    getDateFormated,
    getStoreDetails,
    getCategoriesCount,
    getAllCategoriesInsideThePage,
    getAllCategories,
    getStoresCount,
    getAllStoresInsideThePage,
    calcTotalPrices,
    getTimeAndDateByLocalTime,
    getRemainingTime,
    getDateInUTCFormat,
    calcTotalOrderPriceAfterDiscount,
    getAdminInfo
}