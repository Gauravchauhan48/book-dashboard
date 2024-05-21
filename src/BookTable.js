import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTable, useSortBy, usePagination } from 'react-table';

const BookTable = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const [pagination, setPagination] = useState({
        pageSize: 10,
        pageIndex: 0
    });

    const fetchBooks = async (pageIndex, pageSize) => {
        setLoading(true);
        try {
            const response = await axios.get(
                `https://openlibrary.org/search.json?subject=book&limit=${pageSize}&offset=${pageIndex * pageSize}`
            );
            const books = response.data.docs.map((book) => ({
                ratings_average: book.ratings_average || 'N/A',
                author_name: book.author_name ? book.author_name[0] : 'N/A',
                title: book.title || 'N/A',
                first_publish_year: book.first_publish_year || 'N/A',
                subject: book.subject ? book.subject[0] : 'N/A',
                author_birth_date: book.author_birth_date || 'N/A',
                author_top_work: book.author_top_work || 'N/A'
            }));
            setData(books);
        } catch (error) {
            console.error('Error fetching books:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBooks(pagination.pageIndex, pagination.pageSize);
    }, [pagination.pageIndex, pagination.pageSize]);

    const columns = React.useMemo(
        () => [
            { Header: 'Average Rating', accessor: 'ratings_average' },
            { Header: 'Author Name', accessor: 'author_name' },
            { Header: 'Title', accessor: 'title' },
            { Header: 'First Publish Year', accessor: 'first_publish_year' },
            { Header: 'Subject', accessor: 'subject' },
            { Header: 'Author Birth Date', accessor: 'author_birth_date' },
            { Header: 'Author Top Work', accessor: 'author_top_work' }
        ],
        []
    );

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        prepareRow,
        page,
        canPreviousPage,
        canNextPage,
        pageOptions,
        gotoPage,
        nextPage,
        previousPage,
        setPageSize,
        state: { pageIndex, pageSize }
    } = useTable(
        {
            columns,
            data,
            initialState: { pageIndex: 0, pageSize: 10 }
        },
        useSortBy,
        usePagination
    );

    useEffect(() => {
        setPagination({ pageIndex, pageSize });
    }, [pageIndex, pageSize]);

    return (
        <div>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <>
                    <table {...getTableProps()} style={{ width: '100%', marginBottom: '10px' }}>
                        <thead>
                            {headerGroups.map(headerGroup => (
                                <tr {...headerGroup.getHeaderGroupProps()}>
                                    {headerGroup.headers.map(column => (
                                        <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                                            {column.render('Header')}
                                            <span>
                                                {column.isSorted
                                                    ? column.isSortedDesc
                                                        ? ' 🔽'
                                                        : ' 🔼'
                                                    : ''}
                                            </span>
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody {...getTableBodyProps()}>
                            {page.map(row => {
                                prepareRow(row);
                                return (
                                    <tr {...row.getRowProps()}>
                                        {row.cells.map(cell => (
                                            <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                                        ))}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    <div className="pagination">
                        <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
                            {'<<'}
                        </button>
                        <button onClick={() => previousPage()} disabled={!canPreviousPage}>
                            {'<'}
                        </button>
                        <button onClick={() => nextPage()} disabled={!canNextPage}>
                            {'>'}
                        </button>
                        <button onClick={() => gotoPage(pageOptions.length - 1)} disabled={!canNextPage}>
                            {'>>'}
                        </button>
                        <span>
                            Page{' '}
                            <strong>
                                {pageIndex + 1} of {pageOptions.length}
                            </strong>{' '}
                        </span>
                        <span>
                            | Go to page:{' '}
                            <input
                                type="number"
                                defaultValue={pageIndex + 1}
                                onChange={e => {
                                    const page = e.target.value ? Number(e.target.value) - 1 : 0;
                                    gotoPage(page);
                                }}
                                style={{ width: '50px' }}
                            />
                        </span>{' '}
                        <select
                            value={pageSize}
                            onChange={e => {
                                setPageSize(Number(e.target.value));
                            }}
                        >
                            {[10, 20, 30, 40, 50, 100].map(pageSize => (
                                <option key={pageSize} value={pageSize}>
                                    Show {pageSize}
                                </option>
                            ))}
                        </select>
                    </div>
                </>
            )}
        </div>
    );
};

export default BookTable;
