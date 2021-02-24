import {useState, useRef} from "react";

export interface Controller {
    show: () => void;
    toggle: () => void;
    connectOpen: (fn: Fn) => void;
    connectToggle: (fn: Fn) => void;
}

type Fn = () => void;

const useController = (): Controller => {
    const show = () => openFnc.current?.();
    const toggle = () => toggleFnc.current?.();

    const openFnc = useRef<Fn | null>(null);
    const connectOpen = (func: Fn) => openFnc.current = func;

    const toggleFnc = useRef<Fn | null>(null);
    const connectToggle = (func: Fn) => openFnc.current = func;

    return {show, toggle, connectOpen, connectToggle}
};

export default useController;
