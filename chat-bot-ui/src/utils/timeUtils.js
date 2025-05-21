// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function getMessageTime(showTime) {
  const date = new Date();

  // figure out AM / PM & convert to 12 hour format
  let hours = date.getHours();
  const meridiemFlag = hours >= 12 ? 'pm' : 'am';

  hours = hours % 12;
  hours = hours ? hours : 12; // 0th hour = 12am

  // get the remainder time components
  const paddedHours = hours.toString().padStart(2, '0');
  const minute = date.getMinutes();
  const paddedMinutes = minute.toString().padStart(2, '0');
  const second = date.getSeconds();
  const paddedSeconds = second.toString().padStart(2, '0');

  if (showTime) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    return `${year}-${month}-${day} ${paddedHours}:${paddedMinutes}:${paddedSeconds} ${meridiemFlag}`;
  }

  return `${paddedHours}:${paddedMinutes}:${paddedSeconds} ${meridiemFlag}`;
}
