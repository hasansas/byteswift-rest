/**
 * Sequalize pagintaion
 */

class SequalizePagintaion {
  constructor (req) {
    this.limit = req.query.limit ? parseInt(req.query.limit) : 10
    this.page = req.query.page ? parseInt(req.query.page) : 1
  }

  paginate (data) {
    const totalData = data.total
    const lastPage = Math.ceil(totalData / this.limit)
    const prevPage = this.page > 1 ? this.page - 1 : null
    const nextPage = this.page < lastPage ? this.page + 1 : null
    const pagination = {
      total: totalData,
      lastPage,
      perPage: this.limit,
      prevPage,
      currentPage: this.page,
      nextPage
    }
    const resData = {
      rows: data.rows,
      pagination
    }
    return resData
  }

  offset () {
    const offset = (parseInt(this.page) - 1) * parseInt(this.limit)
    return offset
  }
}

export default (req) => new SequalizePagintaion(req)
