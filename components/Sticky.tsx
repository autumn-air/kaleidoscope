


// className="bg-red-sticky rotate-[30]"
export default function Sticky({className, children, size, onClick}: {className: string, children: React.ReactNode, size?: "sm" | "md" | "lg", onClick?: any}) {
    const sz = ({
        sm: "w-[150px] h-[150px] p-6 ",
        md: "w-[200px] h-[200px] p-8 ",
        lg: "w-[300px] h-[300px] p-12 ",
        none: ""
    } as const)[size ?? "none"];
    return (
        <div onClick={onClick} className={sz + "font-medum text-2xl pencil " + className}>{children}</div>
    )
}