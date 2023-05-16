import {
	Grid,
	Divider,
} from '@mui/material'
import { useState } from 'react'
import TFAComponent from '../Profile/TFAComponent'
import ChangeInfo from '../Profile/ChangeInfo'
import useMediaQuery from "../hooks/useMediaQuery"

const UserPanelGrid = () => {

	const [isAccordion, setIsAccordion] = useState<boolean>(false)
	const isQuery950 = useMediaQuery('(max-width: 950px)')

	return <>
		{isAccordion && isQuery950 ?
			<Divider /> :
			<Divider orientation="vertical" flexItem />
		}
		<Grid item xl={4} md={5} xs={12}
			sx={{
				mx: 0,
//				border: 1,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				'@media (max-width: 950px)': {
					display: 'block'
				}
			}}
		
		>
			<TFAComponent isAccordion={isAccordion} setIsAccordion={setIsAccordion}/>
		</Grid>
		{isQuery950 ?
			<Divider /> :
			<Divider orientation="vertical" variant="middle" flexItem />
		}
		<Grid item xl={8} md={7} xs={12}
			sx={{
//				border: 1,
				display: 'flex',
				pt: 1,
				mt: 2,
//				alignItems: 'center',
				justifyContent: 'center',
				'@media (max-width: 950px)': {
					pt: 0
				}
			}}
		>
			<ChangeInfo isAccordion={isAccordion} setIsAccordion={setIsAccordion}/>
		</Grid>
	</>
}

export default UserPanelGrid;
