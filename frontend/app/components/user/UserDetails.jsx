"use client";
import React from "react";
import dayjs from "dayjs";

// Icons
import { FiCheckCircle } from "react-icons/fi";
import { FaTimesCircle } from "react-icons/fa";
import toast from "react-hot-toast";
import Breadcrumb from "../Breadcrumb";
import Image from "next/image";
import noImg from '@/app/public/images/no-image.png';

const UserDetails = ({ user }) => {
  return (
    <>
      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <Breadcrumb pageName="User Details" />

        {/* Product Information */}
        <div className="mb-4">
          <h5 className="text-lg font-medium bg-gray-200 p-1">
            Basic Information
          </h5>
          <p className="text-gray-700 dark:text-gray-300">
            <strong>First Name:</strong> {user.firstName}
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            <strong>Last Name:</strong> {user.lastName}
          </p>
        </div>

        {/* Product Details */}
        <div className="mb-4">
          <h5 className="text-lg font-medium bg-gray-200 p-1">Authorization</h5>
          <div className="flex gap-4">
            <Image
              src={
                user.avatar
                  ? `${process.env.NEXT_PUBLIC_BASE_URL}/${user.avatar}`
                  : noImg
              }
              alt={user.firstName || "User Avatar"}
              height={80}
              width={80}
            />
            <div>
              <strong>Roles:</strong>{" "}
              {user?.roles?.length > 0 ? (
                <span className="p-3 text-center">
                  {user.roles.map((role) => role.name).join(" | ")}
                </span>
              ) : (
                <span>Not Assigned</span>
              )}
            </div>
          </div>
        </div>

        {/* Contact Summary */}
        <div className="mt-6">
          <h5 className="text-lg font-medium bg-gray-200 p-1">
            Contact Summary
          </h5>
          <div className="flex justify-between py-2">
            <p className="text-gray-700 dark:text-gray-300">
              <strong>MSISDN:</strong> {user.msisdn ?? "Not provided"}
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              <strong>Email:</strong> {user.email ?? "Not provided"}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserDetails;
