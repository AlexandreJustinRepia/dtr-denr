export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center justify-center rounded border border-transparent bg-green-700 px-4 py-2 text-sm font-medium text-white transition duration-150 ease-in-out hover:bg-green-800 focus:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${disabled && 'opacity-50 cursor-not-allowed'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
