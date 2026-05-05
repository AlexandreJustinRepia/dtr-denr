import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export default forwardRef(function TextInput(
    { type = 'text', className = '', isFocused = false, ...props },
    ref,
) {
    const localRef = useRef(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <input
            {...props}
            type={type}
            className={
                'rounded border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-500/20 transition-colors px-3 py-2 text-sm placeholder:text-gray-400 ' +
                className
            }
            ref={localRef}
        />
    );
});
