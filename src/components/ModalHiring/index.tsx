// // components/HireModal.tsx
// import React, { useState } from 'react';
// import { Modal, Button, Input, Select, Text, Image } from '@nextui-org/react';
// import { TalentProps } from '@/utils/globalInterface';
// import Foto from '../../assets/images/Foto=1.png';

// interface HireModalProps {
//   talent: TalentProps;
//   visible: boolean;
//   onClose: () => void;
// }

// const HireModal: React.FC<HireModalProps> = ({ talent, visible, onClose }) => {
//   const [position, setPosition] = useState('');
//   const [notes, setNotes] = useState('');

//   const handleHire = () => {
//     // Handle hire logic here
//     console.log('Hiring:', { position, notes });
//     onClose();
//   };

//   return (
//     <Modal
//       open={visible}
//       onClose={onClose}
//       width='600px'
//     >
//       <Modal.Header>
//         <Text h4>Hire Talent</Text>
//       </Modal.Header>
//       <Modal.Body>
//         <div className='flex flex-col items-center'>
//           <Image src={Foto} alt='Talent' width={100} height={100} className='rounded-full' />
//           <Text h3 className='mt-4'>{talent.name}</Text>
//         </div>
//         <div className='mt-6'>
//           <Text>Position:</Text>
//           <Select
//             placeholder='Select Position'
//             onChange={(value) => setPosition(value)}
//             aria-label='Select Position'
//             className='w-full mt-2'
//           >
//             <Select.Option value='Developer'>Developer</Select.Option>
//             <Select.Option value='Designer'>Designer</Select.Option>
//             <Select.Option value='Manager'>Manager</Select.Option>
//             {/* Add more options as needed */}
//           </Select>
//         </div>
//         <div className='mt-4'>
//           <Text>Notes:</Text>
//           <Input
//             placeholder='Enter additional information'
//             onChange={(e) => setNotes(e.target.value)}
//             aria-label='Notes'
//             className='w-full mt-2'
//           />
//         </div>
//       </Modal.Body>
//       <Modal.Footer>
//         <Button auto flat onClick={onClose}>Cancel</Button>
//         <Button auto onClick={handleHire}>Hire</Button>
//       </Modal.Footer>
//     </Modal>
//   );
// };

// export default HireModal;
