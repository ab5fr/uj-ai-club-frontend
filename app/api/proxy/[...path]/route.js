import { NextResponse } from "next/server";

const API_BASE_URL = "https://api.aiclub-uj.com/api";

export async function GET(request, { params }) {
  const path = params.path.join("/");
  const searchParams = request.nextUrl.searchParams.toString();
  const url = `${API_BASE_URL}/${path}${
    searchParams ? `?${searchParams}` : ""
  }`;

  const token = request.headers.get("authorization");

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = token;
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    const data = await response.text();

    return new NextResponse(data, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("content-type") || "application/json",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Proxy request failed", message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  const path = params.path.join("/");
  const url = `${API_BASE_URL}/${path}`;

  const token = request.headers.get("authorization");
  const contentType = request.headers.get("content-type");

  const headers = {};

  if (token) {
    headers["Authorization"] = token;
  }

  let body;
  if (contentType?.includes("multipart/form-data")) {
    // For FormData, get the body as-is
    body = await request.formData();
  } else {
    // For JSON
    headers["Content-Type"] = "application/json";
    body = await request.text();
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body,
    });

    const data = await response.text();

    return new NextResponse(data, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("content-type") || "application/json",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Proxy request failed", message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  const path = params.path.join("/");
  const url = `${API_BASE_URL}/${path}`;

  const token = request.headers.get("authorization");
  const contentType = request.headers.get("content-type");

  const headers = {};

  if (token) {
    headers["Authorization"] = token;
  }

  let body;
  if (contentType?.includes("multipart/form-data")) {
    body = await request.formData();
  } else {
    headers["Content-Type"] = "application/json";
    body = await request.text();
  }

  try {
    const response = await fetch(url, {
      method: "PUT",
      headers,
      body,
    });

    const data = await response.text();

    return new NextResponse(data, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("content-type") || "application/json",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Proxy request failed", message: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  const path = params.path.join("/");
  const url = `${API_BASE_URL}/${path}`;

  const token = request.headers.get("authorization");
  const body = await request.text();

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = token;
  }

  try {
    const response = await fetch(url, {
      method: "PATCH",
      headers,
      body,
    });

    const data = await response.text();

    return new NextResponse(data, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("content-type") || "application/json",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Proxy request failed", message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  const path = params.path.join("/");
  const url = `${API_BASE_URL}/${path}`;

  const token = request.headers.get("authorization");

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = token;
  }

  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers,
    });

    const data = response.status === 204 ? null : await response.text();

    return new NextResponse(data, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("content-type") || "application/json",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Proxy request failed", message: error.message },
      { status: 500 }
    );
  }
}
