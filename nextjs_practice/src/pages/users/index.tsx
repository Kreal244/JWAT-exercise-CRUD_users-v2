import { User } from "@/type/user";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import axios from "axios";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
export const getServerSideProps = (async () => {
  const res = await fetch("http://localhost:3000/user");
  const repo = await res.json();
  return { props: { repo } };
}) satisfies GetServerSideProps<{
  repo: User[];
}>;

export default function Users({
  repo,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [user, setUser] = useState<User[]>([]);
  const [edit, setEdit] = useState<{
    username: string;
    fullName: string;
    project: string;
    activeYn: boolean;
  }>({
    username: "",
    fullName: "",
    project: "",
    activeYn: false,
  });
  const router = useRouter();
  const [action, setAction] = useState<"update" | "add">("add");
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<{
    username: string;
    fullName: string;
    project: string;
    activeYn: boolean;
  }>();
  useEffect(() => {
    setUser(repo.data);
  }, [repo]);

  useEffect(() => {
    setValue("username", edit.username);
    setValue("fullName", edit.fullName);
    setValue("project", edit.project);
    setValue("activeYn", edit.activeYn);
  }, [edit]);

  const columnHelper = createColumnHelper<User>();
  const columns = [
    columnHelper.accessor("username", {
      cell: (info) => info.getValue(),
      header: () => <span>User name</span>,
    }),
    columnHelper.accessor("fullName", {
      cell: (info) => info.getValue(),
      header: () => <span>Full name</span>,
    }),
    columnHelper.accessor("project", {
      cell: (info) => info.getValue().join(", "),
      header: () => <span>Projects</span>,
    }),
    columnHelper.accessor("activeYn", {
      cell: (info) =>
        info.getValue() ? (
          <span className="text-lime-700">Yes</span>
        ) : (
          <span className="text-red-600">No</span>
        ),
      header: () => <span>Active</span>,
    }),
  ];
  // init table columns
  const table = useReactTable<User>({
    data: user,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  // handle active edit user
  const handleEdit = (index: number) => {
    setAction("update");
    setEdit({ ...user[index], project: user[index].project.join(",") });
  };
  // handle delete
  const handleDelete = async (index: number) => {
    return await axios
      .delete(`http://localhost:3000/user/delete/${user[index].username}`, {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      })
      .then((res) => {
        console.log(res.data.message);
        setTimeout(() => {
          router.refresh();
        }, 2000);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  // handle submit
  const onSubmit: SubmitHandler<{
    username: string;
    fullName: string;
    project: string;
    activeYn: boolean;
  }> = async (data) => {
    const payload = {
      ...data,
      project: data.project.split(","),
    };
    console.log(payload);
    const api = axios.create({
      baseURL: "http://localhost:3000/user",
    });

    if (action == "update") {
      return await api
        .patch(`/update`, payload, {
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        })
        .then((res) => {
          console.log(res.data.message);
          setTimeout(() => {
            router.refresh();
          }, 2000);
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      return await api
        .post(`/`, payload, {
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        })
        .then((res) => {
          console.log(res.data.message);
          console.log(res.data.message);
          setTimeout(() => {
            router.refresh();
          }, 2000);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
  const handleChangeAction = () => {
    if (action === "add") return;
    setAction("add");
    setEdit({ username: "", fullName: "", project: "", activeYn: false });
  };
  return (
    <div className="grid gap-5">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-3 border-collapse border border-gray-600 p-4 rounded-md"
      >
        <div className="min-h-20 flex flex-col">
          <h1 className="text-center capitalize text-lg font-bold">
            {edit.username.length === 0
              ? "Add new users"
              : `edit user: ${edit.username}`}
          </h1>
          <button
            type="button"
            onClick={() => handleChangeAction()}
            className={`rounded-lg border border-gray-700 py-1 px-4 text-gray-700 self-end ${
              !(edit.username.length > 0) ? "hidden" : ""
            }`}
          >
            New user
          </button>
        </div>

        <input
          className=" border-collapse border border-gray-300 py-2 pl-4 rounded-md"
          placeholder="User name"
          defaultValue={edit.username ?? ""}
          {...register("username")}
          disabled={edit.username.length > 0}
        />
        <input
          className=" border-collapse border border-gray-300 py-2 pl-4 rounded-md"
          placeholder="Full name"
          defaultValue={edit.fullName ?? ""}
          {...register("fullName")}
        />
        <input
          className=" border-collapse border border-gray-300 py-2 pl-4 rounded-md"
          placeholder="Projects"
          defaultValue={edit.project ?? ""}
          {...register("project")}
        />
        <div className="flex gap-2 items-center">
          <label htmlFor="activeYn">Active</label>
          <input
            type="checkbox"
            id="activeYn"
            {...register("activeYn")}
            defaultChecked={edit.activeYn ?? false}
          />
        </div>
        <button className="rounded bg-teal-300 py-1 px-4" type="submit">
          Save
        </button>
      </form>
      <table className="table-fixed border-collapse border border-slate-500">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="border border-slate-300 p-2">
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
              <th className="border border-slate-300 p-2"></th>
              <th className="border border-slate-300 p-2"></th>
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row, index) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="border border-slate-300 p-2 text-center">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
              <td className="border border-slate-300 p-2">
                <button
                  className="rounded bg-teal-300 py-1 px-4"
                  onClick={() => handleEdit(index)}
                >
                  Edit
                </button>
              </td>
              <td className="border border-slate-300 p-2">
                <button
                  className="rounded bg-red-600 py-1 px-4 text-white"
                  onClick={() => handleDelete(index)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
