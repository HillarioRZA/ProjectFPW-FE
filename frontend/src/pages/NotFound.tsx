import notfound from '../assets/notfound.png';
import { Link } from 'react-router-dom';

export default function NotFound() {
    return (
        <>
        <body style={{backgroundColor: 'white'}}>
        <div style={{display: 'flex', justifyContent: 'center', marginTop: '50px'}}>
            <img 
                src={notfound}
                alt="404 Not Found" 
                style={{maxWidth: '300px', height: 'auto'}}
            />
        </div>
        <div>
            <p style={{
                textAlign: 'center',
                color: '#666',
                fontSize: '1.2em',
                maxWidth: '600px',
                margin: '0 auto',
                lineHeight: '1.6'
            }}>
                The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>
        </div>
        <div style={{display: 'flex', justifyContent: 'center', marginTop: '20px'}}>
            <Link to="/">
                <button style={{color: 'white', fontWeight: 'bold', fontSize: '16px', padding: '10px', borderRadius: '5px', backgroundColor: 'blue'}}>
                    Back to Homepage
                </button>
            </Link>
        </div>
        </body>
        </>
    );
}

