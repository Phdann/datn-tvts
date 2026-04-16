import { useParams } from 'react-router-dom';

const FacultyDisplay = () => {
    const { slug } = useParams();
    return (
        <div className="p-10">
            <h1 className="text-2xl font-bold">Faculty Display: {slug}</h1>
        </div>
    );
};

export default FacultyDisplay;
