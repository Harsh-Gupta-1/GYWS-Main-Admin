import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Blogs from './allBlogs.jsx';
import CreateBlog from './createBlog.jsx';
import ViewBlog from '../../components/blogs/viewBlog.jsx';
import EditBlog from '../../components/blogs/editBlog.jsx';

const BlogRoutes = () => (
    <Routes>
        <Route path="/" element={<Blogs />} />
        <Route path="create" element={<CreateBlog />} />
        <Route path="view/:id" element={<ViewBlog />} />
        <Route path="edit/:id" element={<EditBlog />} />
    </Routes>
);

export default BlogRoutes;