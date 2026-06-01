export const getTimeAgo = (
    timestamp
) => {
    if (!timestamp) return '';

    const minutes =
        Math.floor(
            (
                Date.now() -
                timestamp.toDate()
            ) /
            60000
        );

    if (minutes < 60)
        return `${minutes}분 전`;

    const hours =
        Math.floor(minutes / 60);

    return `${hours}시간 전`;
};