import { useCallback, useEffect, useState } from "react";
import "./App.css";
import Card from "./components/card/card";
import Cart from "./components/cart/cart";
import { getData } from "./constants/db";

const courses = getData();

const App = () => {
    const [cartItems, setCartItems] = useState([]);

    const telegram = window.Telegram.WebApp;

    useEffect(() => {
        telegram.ready();
    });

    const onAddItem = (item) => {
        const existItem = cartItems.find((c) => c.id == item.id);
        console.log("EXIST_ITEM", existItem);

        if (existItem) {
            const newData = cartItems.map((c) =>
                c.id == item.id
                    ? { ...existItem, quantity: existItem.quantity + 1 }
                    : c
            );
            console.log("ADD_QUANTITY_EXIST_ITEM", newData);
            setCartItems(newData);
        } else {
            const newData = [...cartItems, { ...item, quantity: 1 }];
            console.log("ADD_ITEM", newData);
            setCartItems(newData);
        }
    };
    const onRemoveItem = (item) => {
        const existItem = cartItems.find((c) => c.id == item.id);
        console.log("existItem", existItem);

        if (existItem.quantity === 1) {
            const newData = cartItems.filter((c) => c.id !== item.id);
            console.log("DELETE_ITEM_QUANTITY_0", newData);
            setCartItems(newData);
        } else {
            const newData = cartItems.map((c) =>
                c.id === existItem.id
                    ? { ...existItem, quantity: existItem.quantity - 1 }
                    : c
            );
            console.log("DELETE_ONE_ITEM");
            setCartItems(newData);
        }
    };

    const onCheckout = () => {
        telegram.MainButton.text = "Sotib olish :)";
        telegram.MainButton.show();
    };

    const onSendData = useCallback(() => {
        const queryID = telegram.initDataUnsafe?.query_id;

        if (queryID) {
            fetch("http://localhost:3333/web-data", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ products: cartItems, queryID: queryID }),
            });
        } else {
            telegram.sendData(JSON.stringify(cartItems));
        }
    }, [cartItems]);

    useEffect(() => {
        telegram.onEvent("mainButtonClicked", onSendData);

        return () => telegram.offEvent("mainButtonClicked", onSendData);
    }, [onSendData]);

    return (
        <>
            <h1 className="heading">English courses</h1>
            <Cart cartItems={cartItems} onCheckout={onCheckout} />
            <div className="cards_container">
                {courses.map((course) => (
                    <Card
                        key={course.id}
                        course={course}
                        onAddItem={onAddItem}
                        onRemoveItem={onRemoveItem}
                    />
                ))}
            </div>
        </>
    );
};

export default App;
