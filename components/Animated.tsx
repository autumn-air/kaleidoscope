import { useEffect, useState } from "react";


export default function Animated({children, speed, className}: {children: string | string[], speed?: number, className?: string}) {
    const [offset, setOffset] = useState(0);
    const [intv, setIntv] = useState(undefined as undefined | NodeJS.Timeout);
    const joined = Array.isArray(children) ? children.join("") : children;
    useEffect(() => {
        const interval = setInterval(() => setOffset(o => (o + 1) % 10), speed ?? 800);
        if (intv !== undefined) {
            intv.close();
        }
        setIntv(interval);
    }, [speed])
    return <span className={"dream-wish select-none " + className}>
        {joined.split("").map((x, i, arr) => (
            `${x}${i !== arr.length - 1 ? (i + offset) % 10 : ""}`
        )).join("")}
    </span>
}