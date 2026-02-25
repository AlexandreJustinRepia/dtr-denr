export default function InputError({ message, className = '', ...props }) {
    return message ? (
        <p
            {...props}
            className={'text-xs font-black text-red-500 mt-2 bg-red-50 px-3 py-1 rounded-lg border border-red-100 w-fit ' + className}
        >
            {message}
        </p>
    ) : null;
}
