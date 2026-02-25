export default function InputLabel({
    value,
    className = '',
    children,
    ...props
}) {
    return (
        <label
            {...props}
            className={
                `block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ` +
                className
            }
        >
            {value ? value : children}
        </label>
    );
}
