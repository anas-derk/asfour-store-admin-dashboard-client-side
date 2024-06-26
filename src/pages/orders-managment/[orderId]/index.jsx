import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import LoaderPage from "@/components/LoaderPage";
import ErrorOnLoadingThePage from "@/components/ErrorOnLoadingThePage";
import AdminPanelHeader from "@/components/AdminPanelHeader";
import { getAdminInfo } from "../../../../public/global_functions/popular";

export default function OrderDetails({ orderId }) {

    const [isLoadingPage, setIsLoadingPage] = useState(true);

    const [isErrorMsgOnLoadingThePage, setIsErrorMsgOnLoadingThePage] = useState(false);

    const [adminInfo, setAdminInfo] = useState({});

    const [orderDetails, setOrderDetails] = useState({});

    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    const [isDeletingStatus, setIsDeletingStatus] = useState(false);

    const [errorMsg, setErrorMsg] = useState("");

    const [successMsg, setSuccessMsg] = useState("");

    const router = useRouter();

    useEffect(() => {
        const adminToken = localStorage.getItem(process.env.adminTokenNameInLocalStorage);
        if (adminToken) {
            getAdminInfo()
                .then(async (result) => {
                    if (result.error) {
                        localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                        await router.replace("/login");
                    } else {
                        const adminDetails = result.data;
                        if (adminDetails.isBlocked) {
                            localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                            await router.replace("/login");
                        } else {
                            setAdminInfo(adminDetails);
                            result = await getOrderDetails(orderId);
                            if (!result.error) {
                                setOrderDetails(result.data);
                                setIsLoadingPage(false);
                            }
                        }
                    }
                })
                .catch(async (err) => {
                    if (err?.response?.data?.msg === "Unauthorized Error") {
                        localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                        await router.replace("/login");
                    }
                    else {
                        setIsLoadingPage(false);
                        setIsErrorMsgOnLoadingThePage(true);
                    }
                });
        } else router.replace("/login");
    }, []);

    const getOrderDetails = async (orderId) => {
        try {
            const res = await axios.get(`${process.env.BASE_API_URL}/orders/order-details/${orderId}`);
            return res.data;
        }
        catch (err) {
            throw Error(err);
        }
    }

    const changeOrderProductData = (productIndex, fieldName, newValue) => {
        let orderLinesTemp = orderDetails.order_products;
        orderLinesTemp[productIndex][fieldName] = newValue;
        setOrderDetails({ ...orderDetails, order_products: orderLinesTemp });
    }

    const updateOrderProductData = async (orderProductIndex) => {
        try {
            setIsUpdatingStatus(true);
            const res = await axios.put(`${process.env.BASE_API_URL}/orders/products/update-product/${orderDetails._id}/${orderDetails.order_products[orderProductIndex].productId}`, {
                quantity: orderDetails.order_products[orderProductIndex].quantity,
                name: orderDetails.order_products[orderProductIndex].name,
                total_amount: orderDetails.order_products[orderProductIndex].total_amount,
                unit_price: orderDetails.order_products[orderProductIndex].unit_price,
            }, {
                headers: {
                    Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
                }
            });
            const result = res.data;
            if (!result.error) {
                setIsUpdatingStatus(false);
                setSuccessMsg(result.msg);
                let successTimeout = setTimeout(() => {
                    setSuccessMsg("");
                    clearTimeout(successTimeout);
                }, 1500);
            }
        }
        catch (err) {
            if (err?.response?.data?.msg === "Unauthorized Error") {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.replace("/login");
                return;
            }
            setIsUpdatingStatus(false);
            setErrorMsg("Sorry, Someting Went Wrong, Please Repeate The Process !!");
            let errorTimeout = setTimeout(() => {
                setErrorMsg("");
                clearTimeout(errorTimeout);
            }, 1500);
        }
    }

    const deleteProductFromOrder = async (orderProductIndex) => {
        try {
            setIsDeletingStatus(true);
            const res = await axios.delete(`${process.env.BASE_API_URL}/orders/products/delete-product/${orderDetails._id}/${orderDetails.order_products[orderProductIndex].productId}`, {
                headers: {
                    Authorization: localStorage.getItem(process.env.adminTokenNameInLocalStorage),
                }
            });
            const result = res.data;
            if (!result.error) {
                setIsDeletingStatus(false);
                setSuccessMsg(result.msg);
                let successTimeout = setTimeout(() => {
                    setSuccessMsg("");
                    orderDetails.order_products = result.data.newOrderProducts;
                    clearTimeout(successTimeout);
                }, 1500);
            }
        }
        catch (err) {
            if (err?.response?.data?.msg === "Unauthorized Error") {
                localStorage.removeItem(process.env.adminTokenNameInLocalStorage);
                await router.replace("/login");
                return;
            }
            setIsDeletingStatus(false);
            setErrorMsg("Sorry, Someting Went Wrong, Please Repeate The Process !!");
            let errorTimeout = setTimeout(() => {
                setErrorMsg("");
                clearTimeout(errorTimeout);
            }, 1500);
        }
    }

    return (
        <div className="order-details admin-dashboard">
            <Head>
                <title>Ubuyblues Store Admin Dashboard - Order Details</title>
            </Head>
            {!isLoadingPage && !isErrorMsgOnLoadingThePage && <>
                {/* Start Admin Dashboard Side Bar */}
                <AdminPanelHeader isWebsiteOwner={adminInfo.isWebsiteOwner} isMerchant={adminInfo.isMerchant} />
                {/* Start Admin Dashboard Side Bar */}
                {/* Start Content Section */}
                <section className="page-content d-flex justify-content-center align-items-center flex-column text-center pt-4 pb-4 p-4">
                    <div className="container-fluid">
                        <h1 className="welcome-msg mb-4 fw-bold pb-3 mx-auto">Hello To You In Orders Details Page</h1>
                        {Object.keys(orderDetails).length > 0 ? <div className="order-details-box p-3 data-box admin-dashbboard-data-box">
                            <table className="order-data-table mb-5 managment-table admin-dashbboard-data-table">
                                <thead>
                                    <tr>
                                        <th>Reference / Product Id</th>
                                        <th>Quantity</th>
                                        <th>Name</th>
                                        <th>Unit Price</th>
                                        <th>Total</th>
                                        <th>Image</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orderDetails.order_products.map((orderProduct, orderProductIndex) => (
                                        <tr key={orderProduct._id}>
                                            <td>{orderProduct._id}</td>
                                            <td>
                                                <input
                                                    type="number"
                                                    className="form-control quantity"
                                                    defaultValue={orderProduct.quantity}
                                                    onChange={(e) => changeOrderProductData(orderProductIndex, "quantity", e.target.valueAsNumber)}
                                                    disabled={orderDetails.isDeleted}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    className="form-control name"
                                                    defaultValue={orderProduct.name}
                                                    onChange={(e) => changeOrderProductData(orderProductIndex, "name", e.target.value)}
                                                    disabled={orderDetails.isDeleted}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    className="form-control unit-price"
                                                    defaultValue={orderProduct.unit_price}
                                                    onChange={(e) => changeOrderProductData(orderProductIndex, "unit_price", e.target.valueAsNumber)}
                                                    disabled={orderDetails.isDeleted}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    className="form-control total-amount"
                                                    defaultValue={orderProduct.total_amount}
                                                    onChange={(e) => changeOrderProductData(orderProductIndex, "total_amount", e.target.valueAsNumber)}
                                                    disabled={orderDetails.isDeleted}
                                                />
                                            </td>
                                            <td>
                                                <img
                                                    src={`${process.env.BASE_API_URL}/${orderProduct.image_path}`}
                                                    alt="product Image !!"
                                                    width="100"
                                                    height="100"
                                                />
                                            </td>
                                            <td>
                                                {!orderDetails.isDeleted ? <>
                                                    {!isUpdatingStatus && !isDeletingStatus && !errorMsg && !successMsg && <button
                                                        className="btn btn-info d-block mx-auto mb-3 global-button"
                                                        onClick={() => updateOrderProductData(orderProductIndex)}
                                                    >
                                                        Update
                                                    </button>}
                                                    {isUpdatingStatus && <button
                                                        className="btn btn-info d-block mx-auto mb-3 global-button"
                                                        disabled
                                                    >
                                                        Updating ...
                                                    </button>}
                                                    {!isUpdatingStatus && !isDeletingStatus && !errorMsg && !successMsg && orderDetails.order_products.length > 1 && <button
                                                        className="btn btn-danger d-block mx-auto mb-3 global-button"
                                                        onClick={() => deleteProductFromOrder(orderProductIndex)}
                                                    >
                                                        Delete
                                                    </button>}
                                                    {isDeletingStatus && <button
                                                        className="btn btn-danger d-block mx-auto mb-3 global-button"
                                                        disabled
                                                    >
                                                        Deleting ...
                                                    </button>}
                                                    {successMsg && <button
                                                        className="btn btn-success d-block mx-auto global-button"
                                                        disabled
                                                    >{successMsg}</button>}
                                                    {errorMsg && <button
                                                        className="btn btn-danger d-block mx-auto global-button"
                                                        disabled
                                                    >{errorMsg}</button>}
                                                </> : <span className="fw-bold text-danger">Reject Actions</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div> : <p className="alert alert-danger order-not-found-error">Sorry, This Order Is Not Found !!</p>}
                        {Object.keys(orderDetails).length > 0 && <section className="customer-info">
                                <div className="row">
                                    <div className="col-md-6 bg-white border border-2 border-dark">
                                        <div className="billing-address-box text-start p-3">
                                            <h6 className="fw-bold">Billing Address</h6>
                                            <hr />
                                            <p className="city fw-bold info">City: {orderDetails.billing_address.city}</p>
                                            <p className="email fw-bold info">Email: {orderDetails.billing_address.email}</p>
                                            <p className="name fw-bold info">Name: {orderDetails.billing_address.first_name}</p>
                                            <p className="family-name fw-bold info">Family Name: {orderDetails.billing_address.last_name}</p>
                                            <p className="phone fw-bold info">Phone: {orderDetails.billing_address.phone}</p>
                                            <p className="postal-code fw-bold info">Postal Code: {orderDetails.billing_address.postal_code}</p>
                                            <p className="street-address fw-bold info">Street Address: {orderDetails.billing_address.street_address}</p>
                                            <p className="apartment-number fw-bold info">Apartment Number: {orderDetails.billing_address.apartment_number}</p>
                                        </div>
                                    </div>
                                    <div className="col-md-6 bg-white border border-2 border-dark">
                                        <div className="shipping-address-box text-start p-3">
                                            <h6 className="fw-bold">Shipping Address</h6>
                                            <hr />
                                            <p className="city fw-bold info">City: {orderDetails.shipping_address.city}</p>
                                            <p className="email fw-bold info">Email: {orderDetails.shipping_address.email}</p>
                                            <p className="name fw-bold info">Name: {orderDetails.shipping_address.first_name}</p>
                                            <p className="family-name fw-bold info">Family Name: {orderDetails.shipping_address.last_name}</p>
                                            <p className="phone fw-bold info">Phone: {orderDetails.shipping_address.phone}</p>
                                            <p className="postal-code fw-bold info">Postal Code: {orderDetails.shipping_address.postal_code}</p>
                                            <p className="street-address fw-bold info">Street Address: {orderDetails.shipping_address.street_address}</p>
                                            <p className="apartment-number fw-bold info">Apartment Number: {orderDetails.shipping_address.apartment_number}</p>
                                        </div>
                                    </div>
                                </div>
                        </section>}
                    </div>
                </section>
                {/* End Content Section */}
            </>}
            {isLoadingPage && !isErrorMsgOnLoadingThePage && <LoaderPage />}
            {isErrorMsgOnLoadingThePage && <ErrorOnLoadingThePage />}
        </div>
    );
}

export async function getServerSideProps(context) {
    const orderId = context.query.orderId;
    if (!orderId) {
        return {
            redirect: {
                permanent: false,
                destination: "/404",
            },
        }
    } else {
        return {
            props: {
                orderId,
            },
        }
    }
}