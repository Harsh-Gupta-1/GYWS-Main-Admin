import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Members from './allMembers.jsx';
import Addmembers from './addMember.jsx'
import ViewMember from '../../components/members/viewMember.jsx';
import EditMember from '../../components/members/editMember.jsx';

const MemberRoutes = () => (
    <Routes>
        <Route path="/" element={<Members />} />
        <Route path="create" element={<Addmembers />} />
        <Route path="view/:id" element={<ViewMember />} />
        <Route path="edit/:id" element={<EditMember />} />
    </Routes>
);

export default MemberRoutes;