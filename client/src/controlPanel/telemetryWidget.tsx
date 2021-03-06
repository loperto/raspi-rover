export let TelemetryWidget = (props: { icon: string, value: string }) => {
    const { icon, value } = props;
    const height: number = 30;
    return (
        <div className="text-center" style={{ margin: 5, color: "white" }}>
            <div style={{ backgroundColor: "blue", padding: 5, width: 30, height: height, display: "inline-block" }}>
                <i className={icon} />
            </div>
            <div style={{ backgroundColor: "black", padding: 5, height: height, minWidth: 40, display: "inline-block" }}>
                <span style={{ fontSize: 12 }}>{value}</span>
            </div>
        </div >
    );
}