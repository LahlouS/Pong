import './App.css';
import './index.css';
import { Pong } from './pong/Pong'
import Particles from 'particlesjs'
import { useEffect } from 'react'

function App() {

	useEffect(() => {
		/*const particles =*/ Particles.init({
			selector: '.background',
			maxParticles: 150,
//			color: '#aeb6bf',
			color: '#FFFFFF',
//			connectParticles: true,
			connectParticles: false,
			speed: 0.1,
			minDistance: 120,
//			sizeVariations: 1,
			responsive: [
				{
					breakpoint: 1500,
					options: {
						maxParticles: 120,
//						minDistance: 120,
//						connectParticles: true
					}
				}, {
					breakpoint: 1250,
					options: {
						maxParticles: 100,
//						minDistance: 110,
//						connectParticles: true
					}
				}, {
					breakpoint: 1024,
					options: {
						maxParticles: 80,
//						minDistance: 100,
//						connectParticles: true
					}
				}, {
					breakpoint: 768,
					options: {
						maxParticles: 60,
//						minDistance: 100,
//						connectParticles: true
				}
				}, {
					breakpoint: 425,
					options: {
						maxParticles: 25,
//						minDistance: 100,
//						connectParticles: true
				}
				}, {
					breakpoint: 320,
					options: {
//						minDistance: 40,
//						maxParticles: 10 // disables particles.js
					}
				}
			]
		});
	}, [])

	return (
		<>
			<canvas className="background"></canvas>
			<Pong />
		</>
	);
}


export default App;
