export default function ApplicationLogo(props) {
    return (
        <img
            {...props}
            src="/storage/images/logo.png"
            alt="DENR Logo"
            className={`${props.className} object-contain`}
        />
    );
}
